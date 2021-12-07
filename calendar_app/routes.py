from flask import render_template, request
from flask_login import login_user, logout_user, current_user

from calendar_app import app, db, bcrypt
from calendar_app.models import User, Event
from calendar_app.validators import validate_user_data, validate_event_data


@app.route('/', methods=['GET'])
def home():
    if not current_user.is_authenticated:
        return render_template('logged-out.html')
    
    return render_template('logged-in.html')
    

@app.route('/events', methods=['GET'])
def get_events():
    if not current_user.is_authenticated:
        return {
            'status': 'NOT_AUTHENTICATED',
        }

    dict_events = {}
    for event in current_user.events:
        
        if event.year not in dict_events:
            dict_events[event.year] = {}
        if event.month not in dict_events[event.year]:
            dict_events[event.year][event.month] = {}
        if event.day not in dict_events[event.year][event.month]:
            dict_events[event.year][event.month][event.day] = []
        
        dict_events[event.year][event.month][event.day].append({
            'day': event.day, 'month': event.month, 'year': event.year,
            'hours': event.hours, 'minutes': event.minutes,
            'description': event.description, 
            'color': event.color,
            'id': event.id,
        })

    return {
        'status': 'OK',
        'dict_events': dict_events,
        'user_email': current_user.email,
    }


@app.route('/event', methods=['POST'])
def create_event():
    if not current_user.is_authenticated:
        return {
            'status': 'NOT_AUTHENTICATED',
        }

    error_messages, cleaned_data = validate_event_data(**request.json)
    if error_messages:
        return {
            'status': 'INVALID_DATA',
            'error_messages': error_messages,
        }

    new_event = Event(user_id=current_user.id, **cleaned_data)
    db.session.add(new_event)
    db.session.commit()
    return {
        'status': 'OK',
    }


@app.route('/event/<event_id>', methods=['PUT', 'DELETE'])
def update_or_delete_event(event_id):
    if not current_user.is_authenticated:
        return {
            'status': 'NOT_AUTHENTICATED',
        }
    
    event = Event.query.get(int(event_id))
    if event.user_id != current_user.id:
        return {
            'status': 'INVALID_DATA',
        }
    
    if request.method == 'PUT':  # update event
        error_messages, cleaned_data = validate_event_data(**request.json)
        if error_messages:
            return {
                'status': 'INVALID_DATA',
                'error_messages': error_messages,
            }

        for key, value in cleaned_data.items():
            setattr(event, key, value)
        db.session.commit()

    elif request.method == 'DELETE':  # delete event
        db.session.delete(event)
        db.session.commit()

    return {
        'status': 'OK',
    }


@app.route('/email_status/', defaults={'email': ''}, methods=['GET'])
@app.route('/email_status/<email>', methods=['GET'])
def get_email_status(email):
    error_messages = validate_user_data(email=email)
    if error_messages:
        return { 
            'status': 'INVALID_DATA',
            'error_messages': error_messages,
        }

    user = User.query.filter_by(email=email).first()
    if user:
        return {
            'status': 'OK',
            'operation_type': 'login',
        }
    return {
        'status': 'OK',
        'operation_type': 'register',
    }


@app.route('/login_or_register', methods=['POST'])
def login_or_register():
    request_email = request.json['email']
    request_password = request.json['password']

    user = User.query.filter_by(email=request_email).first()
    if user:  # log in
        if not bcrypt.check_password_hash(user.hashed_password, request_password):
            error_messages = ['Please, check your password.']
            return {
                'status': 'INVALID_DATA',
                'error_messages': error_messages,
            }
        login_user(user, remember=True)
        
    else:  # register
        error_messages = validate_user_data(email=request_email, password=request_password)
        if error_messages:
            return {
                'status': 'INVALID_DATA', 
                'error_messages': error_messages,
            }
        
        hashed_password = bcrypt.generate_password_hash(request_password).decode('utf-8')
        new_user = User(email=request_email, hashed_password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user, remember=True)

    return {
        'status': 'OK',
    }


@app.route('/logout', methods=['GET'])
def logout():
    if not current_user.is_authenticated:
        return {
            'status': 'NOT_AUTHENTICATED',
        }

    logout_user()
    return {
        'status': 'OK',
    }
