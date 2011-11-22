from pcrsite.lib.api import api


#we use this to provide data in the case that a course doesn't have lectures
#if a course doesn't, it will attempt to show seminar data, else lab data, else recitation data 
#TODO: use this
TYPE_RANK = ('LEC', 'SEM', 'LAB', 'REC')


class Review(object):
  def __init__(self, rid):
    tokens = rid.split("-")
    #NOTE: Since a professor's name is hyphen separated we have to be careful
    course_id, section_id, instructor_id = tokens[0], tokens[1], "-".join(tokens[2:])
    try:
      raw_self = api('courses', course_id, 'sections', section_id, 'reviews', instructor_id)
    except ValueError as e:
      raise e
    else:
      self.id = raw_self['id']
      self.comments = raw_self['comments']
      self.num_students = raw_self['num_students']
      self.num_reviewers = raw_self['num_reviewers']
      self.ratings = dict((k, float(v)) for k, v in raw_self['ratings'].items())
      self.__instructor_id = raw_self['instructor']['id']
      self.__section_id = raw_self['section']['id']

  @property
  def instructor(self):
    return Instructor(self.__instructor_id)

  @property
  def section(self):
    return Section(self.__section_id)

  def __cmp__(self, other):
    return cmp(self.id, other.id)

  def __repr__(self):
    return "Review(%s)" % self.id


class Instructor(object):
  def __init__(self, iid):
    try:
      raw_self = api('instructors', iid)
    except ValueError as e:
      raise e
    else:
      self.id = raw_self['id']
      self.name = raw_self['name']
      self.__section_ids = set(section['id'] for section in raw_self['sections']['values'])
      self.__review_ids = set(review['id'] for review in raw_self['reviews']['values'])

  @property
  def last_name(self):
    return self.name.split()[-1]

  @property
  def sections(self):
    return set(Section(section_id) for section_id in self.__section_ids)

  @property
  def reviews(self):
    return set(Review(review_id) for review_id in self.__review_ids)

  @property
  def url(self):
    return 'instructors/%s' % self.id

  def __cmp__(self, other):
    return cmp(self.id, other.id)

  def __eq__(self, other):
    return self.id == other.id

  def __hash__(self):
    return hash(self.id)

  def __repr__(self):
    return "Instructor(%s)" % self.name


class Section(object):
  def __init__(self, sid):
    course_id, section_id = sid.split("-")
    try:
      raw_self = api('courses', course_id, 'sections', section_id)
    except ValueError as e:
      raise e
    else:
      self.id = raw_self['id']
      self.name = raw_self['name']
      self.sectionnum = raw_self['sectionnum']
      self.__course_id = raw_self['courses']['id'] #TODO: Request change
      self.__instructor_ids = set(instructor['id'] for instructor in raw_self['instructors'])
      self.__review_ids = set(review['id'] for review in raw_self['reviews']['values'])

  @property
  def course(self):
    return Course(self.__course_id)

  @property
  def instructors(self):
    return set(Instructor(instructor_id) for instructor_id in self.__instructor_ids)

  @property
  def reviews(self):
    return set(Review(review_id) for review_id in self.__review_ids)

  def __cmp__(self, other):
    return cmp(self.id, other.id)

  def __hash__(self):
    return hash(self.id)

  def __repr__(self):
    return "Section(%s)" % self.id


class Course(object):
  def __init__(self, cid):
    try:
      raw_self = api('courses', cid)
    except ValueError as e:
      raise e
    else:
      self.id = raw_self['id']
      self.aliases = set(alias for alias in raw_self['aliases'])
      self.description = raw_self['description']
      self.semester = raw_self['semester']
      self.__coursehistory_id = raw_self['coursehistories']['path'].split("/")[-1]
      self.__section_ids = set(section['id'] for section in raw_self['sections']['values'])

  @property
  def coursehistory(self):
    return CourseHistory(self.__coursehistory_id)

  @property
  def sections(self):
    return set(Section(section_id) for section_id in self.__section_ids)
  
  @property
  def url(self):
    return "courses/%s" % self.id

  def __cmp__(self, other):
    return cmp(self.id, other.id)

  def __eq__(self, other):
    return self.id == other.id

  def __hash__(self):
    return hash(self.id)

  def __repr__(self):
    return 'Course(%s)' % self.id


class CourseHistory(object):
  def __init__(self, chid):
    #constructor id can either be one if its aliases, or numeric id
    try:
      raw_self = api('coursehistories', chid)
    except ValueError as e:
      raise e
    else:
      self.id = raw_self['id']
      self.aliases = set(raw_self['aliases'])
      self.name = raw_self['name'] #ie PROG LANG AND TECH II
      self.__course_ids = set(course['id'] for course in raw_self['courses'])

  @property
  def courses(self):
    return set(Course(course_id) for course_id in self.__course_ids)

  @property
  def alias(self):
    for alias in self.aliases:
      return alias

  @property
  def description(self):
    for course in sorted(self.courses, key=lambda c: c.semester, reverse=True):
      if course.description:
        return course.description
    return None
  
  @property
  def url(self):
    #TODO: This is made to satisfy the views, but is wrong. Fix it.
    return "course/%s" % self.alias

  def __eq__(self, other):
    return self.id == other.id

  def __cmp__(self, other):
    return cmp(self.id, other.id)
  
  def __hash__(self):
    return hash(self.id)

  def __repr__(self):
    return 'CourseHistory(%s)' % self.id
