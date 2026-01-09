class Exam(Base):
    __tablename__ = "Exam"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    start_time = Column(Date, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    mark = Column(DECIMAL, nullable=False)
    minus_mark = Column(DECIMAL, nullable=False)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=False)

    course = relationship("Course", back_populates="exams")
    questions = relationship("Question", back_populates="exam")
    results = relationship("Result", back_populates="exam")
    answers = relationship("Answer", back_populates="exam")