from flask_login import UserMixin

from calendar_app import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    hashed_password = db.Column(db.String(60), nullable=False)
    events = db.relationship('Event', backref='author', order_by='[Event.hours.asc(), Event.minutes.asc()]', lazy=True)

    def __repr__(self):
        return f'User {self.id}'


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.String(2), nullable=False)  # 'dd'
    month = db.Column(db.String(2), nullable=False)  # 'mm'
    year = db.Column(db.String(4), nullable=False)  # 'yyyy'
    hours = db.Column(db.String(2), nullable=False)  # 'hh'
    minutes = db.Column(db.String(2), nullable=False)  # 'mm'
    description = db.Column(db.String(300), nullable=False)
    color = db.Column(db.String(7), nullable=False)  # '#cccccc'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'Event {self.id}'
