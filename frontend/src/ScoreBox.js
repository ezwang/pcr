import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import ScoreTable from './ScoreTable';
import ColumnSelector from './ColumnSelector';
import { convertInstructorName, CourseLine } from './Tags';
import { PopoverTitle } from './Popover';


import 'react-table/react-table.css';


export function getColumnName(key) {
    return key.substring(1).split(/(?=[A-Z])/).join(" ").replace("T A", "TA").replace(/Recommend/g, "Rec.");
}


class ScoreBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            columns: null,
            isAverage: localStorage.getItem("meta-column-type") !== "recent",
            filtered: [],
            currentInstructors: {},
            currentCourses: {},
            filterAll: ""
        };

        this.handleClick = this.handleClick.bind(this);
        this.updateLiveData = this.updateLiveData.bind(this);
    }

    handleClick(val) {
        return () => {
            localStorage.setItem("meta-column-type", val ? "average" : "recent");
            this.setState(state => ({
                isAverage: val
            }));
            this.refs.table.resort();
        };
    }

    updateLiveData() {
        const instructor_taught = {};

        if (this.props.type === "course") {
            Object.values(this.props.data.instructors).forEach((a) => {
                const key = convertInstructorName(a.name);
                if (a.most_recent_semester) {
                    const parts = a.most_recent_semester.split(" ");
                    instructor_taught[key] = parseInt(parts[1]) * 3 + {'Spring': 0, 'Summer': 1, 'Fall': 2}[parts[0]];
                }
                else {
                    instructor_taught[key] = 0;
                }
            });

            if (this.props.live_data) {
                const instructors_this_semester = {};
                (this.props.live_data.instructors || []).forEach((a) => {
                    const data = {
                        open: 0,
                        all: 0,
                        sections: []
                    };
                    const key = convertInstructorName(a);
                    Object.values(this.props.live_data.courses).forEach((cat) => {
                        const all_courses_by_instructor = cat.filter((a) => a.instructors.map((b) => convertInstructorName(b.name)).indexOf(key) !== -1).filter((a) => !a.is_cancelled);
                        data.open += all_courses_by_instructor.filter((a) => !a.is_closed).length;
                        data.all += all_courses_by_instructor.length;
                        data.sections = data.sections.concat(all_courses_by_instructor.map((a) => a));
                    });
                    instructors_this_semester[key] = data;
                    instructor_taught[key] = Infinity;
                });

                this.setState((state) => ({
                    currentInstructors: instructor_taught,
                    data: state.data.map((a) => ({...a, star: instructors_this_semester[convertInstructorName(a.name)] }))
                }));
            }
            else {
                this.setState((state) => ({
                    currentInstructors: instructor_taught,
                    data: state.data.map((a) => ({...a, star: null}))
                }));
            }
        }
        else if (this.props.type === "instructor") {
            if (this.props.live_data) {
                const courses = {};
                Object.values(this.props.live_data.courses).forEach((a) => {
                    const key = a.course_department + "-" + a.course_number;
                    if (!(key in courses)) {
                        courses[key] = [];
                    }
                    courses[key].push(a);
                });
                this.setState({
                    currentCourses: courses
                });
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.live_data !== this.props.live_data) {
            this.updateLiveData();
        }
    }

    componentDidMount() {
        const results = this.props.data;

        const columns = {};
        const is_course = this.props.type === "course";
        const is_instructor = this.props.type === "instructor";
        const data = Object.keys(is_course ? results.instructors : results.courses).map((key) => {
            const val = is_course ? results.instructors[key] : results.courses[key];
            const output = {};
            Object.keys(val.average_reviews).forEach((col) => {
                output[col] = {
                    average: val.average_reviews[col].toFixed(2),
                    recent: val.recent_reviews[col].toFixed(2)
                };
                columns[col] = true;
            });
            output.key = is_course ? key : val.code;
            output.name = val.name;
            output.semester = val.most_recent_semester;
            output.code = val.code;
            return output;
        });
        const cols = Object.keys(columns).sort().map((key) => {
            var header = getColumnName(key);
            return {
                id: key,
                Header: header,
                accessor: key,
                sortMethod: (a, b) => {
                    if (a && b) {
                        a = this.state.isAverage ? a.average : a.recent;
                        b = this.state.isAverage ? b.average : b.recent;
                        return a > b ? 1 : -1;
                    }
                    return a ? 1 : -1;
                },
                Cell: props => <center>
                                    { this.state.isAverage ? <span className={'cell_average' + (!props.value ? ' empty' : '')}>{props.value ? props.value.average : "N/A"}</span> :
                                    <span className={'cell_recent' + (!props.value ? ' empty' : '')}>{props.value ? props.value.recent : "N/A"}</span> }
                               </center>,
                width: 140,
                show: true
            };
        });
        cols.unshift({
            id: "name",
            Header: is_course ? "Instructor" : "Course",
            accessor: "name",
            width: 270,
            show: true,
            required: true,
            Cell: props => <span>
                {is_course && <Link to={"/instructor/" + props.original.key} className="mr-1" style={{color: 'rgb(102, 146, 161)'}}><i className="instructor-link far fa-user"></i></Link>}
                {props.value}
                {props.original.star && <PopoverTitle title={
                    <span>
                        <b>{props.value}</b> is teaching during <b>{this.props.live_data.term}</b> and <b>{props.original.star.open}</b> out of <b>{props.original.star.all}</b> section(s) are open.
                        <ul style={{ marginBottom: 0 }}>
                            {props.original.star.sections.sort((x, y) => x.section_id_normalized.localeCompare(y.section_id_normalized)).map((a, i) => <CourseLine key={i} data={a} />)}
                        </ul>
                    </span>
                }><i className={'fa-star ml-1 ' + (props.original.star.open ? 'fa' : 'far')}></i></PopoverTitle>}
                {is_instructor && !!this.state.currentCourses[props.original.code] && <PopoverTitle title={
                    <span>
                        <b>{this.props.data.name}</b> will teach <b>{props.original.code}</b> in <b>{this.state.currentCourses[props.original.code][0].term_normalized}</b>.
                    </span>
                }><i className="ml-1 fa fa-star" /></PopoverTitle>}
            </span>,
            sortMethod: (a, b) => {
                const aname = convertInstructorName(a);
                const bname = convertInstructorName(b);
                const hasStarA = this.state.currentInstructors[aname];
                const hasStarB = this.state.currentInstructors[bname];
                if (hasStarA && !hasStarB) {
                    return -1;
                }
                if (!hasStarA && hasStarB) {
                    return 1;
                }
                if (hasStarA !== hasStarB) {
                    return hasStarB - hasStarA;
                }
                return a.localeCompare(b);
            },
            filterMethod: (filter, rows) => {
                if (filter.value === "") {
                    return true;
                }
                return rows[filter.id].toLowerCase().includes(filter.value.toLowerCase());
            }
        });
        if (!is_course) {
            cols.unshift({
                id: "code",
                Header: "Code",
                accessor: "code",
                width: 100,
                show: true,
                required: true,
                Cell: props => <center><Link to={"/course/" + props.value}>{props.value}</Link></center>
            });
        }
        this.setState(state => ({
            data: data,
            columns: cols
        }));

        if (this.props.live_data) {
            this.updateLiveData();
        }
    }

    render() {
        if (!this.state.data) {
            return <h1>Loading Data...</h1>;
        }

        const is_course = this.props.type === "course";

        return (
            <div className="box">
                <div className="clearfix">
                    <div className="btn-group">
                        <button onClick={this.handleClick(true)} className={"btn btn-sm " + (this.state.isAverage ? 'btn-primary' : 'btn-secondary')}>Average</button>
                        <button onClick={this.handleClick(false)} className={"btn btn-sm " + (this.state.isAverage ? 'btn-secondary' : 'btn-primary')}>Most Recent</button>
                    </div>
                    <ColumnSelector name="score" columns={this.state.columns} onSelect={(cols) => this.setState({ columns: cols })} />
                    <div className="float-right">
                        <label className="table-search"><input value={this.state.filterAll} onChange={(val) => this.setState({ filtered: [{id: "name", value: val.target.value}], filterAll: val.target.value })} type="search" className="form-control form-control-sm" /></label>
                    </div>
                </div>
                <ScoreTable multi={this.props.type === "department"} sorted={[{id: is_course ? 'name' : 'code', desc: false}]} ref="table" filtered={this.state.filtered} data={this.state.data} columns={this.state.columns} onSelect={this.props.onSelect} noun={is_course ? "instructor" : "course"} />
            </div>
        );
    }
}

export default ScoreBox;
