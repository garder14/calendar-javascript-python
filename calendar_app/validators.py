import re
from datetime import datetime


def validate_user_data(email, password=None):
    error_messages = []
    
    if re.fullmatch(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z-]+)+', email) is None:
        error_messages.append('Please, enter a valid email.')

    if password is not None and len(password) < 6:
        error_messages.append('Your password should be at least 6 characters.')

    return error_messages
    

def validate_event_data(day, month, year, hours, minutes, description, color):
    error_messages = []
    
    try:
        datetime_obj = datetime.strptime(f'{day}-{month}-{year} {hours}:{minutes}', '%d-%m-%Y %H:%M')
    except ValueError:
        error_messages.append(f'The datetime "{day}-{month}-{year} {hours}:{minutes}" does not match the format "dd-mm-yyyy hh:mm", or does not exist.')
    
    if len(description) == 0:
        error_messages.append('The description should not be empty.')
    elif len(description) > 200:
        error_messages.append('The description should be at most 200 characters.')
    
    if re.fullmatch(r'^#[0-9a-fA-F]{6}', color) is None:
        error_messages.append('The color is not valid.')

    if error_messages:
        return error_messages, {}
    else:
        return error_messages, {
            'day': f'{datetime_obj.day:02d}',
            'month': f'{datetime_obj.month:02d}',
            'year': f'{datetime_obj.year:04d}',
            'hours': f'{datetime_obj.hour:02d}',
            'minutes': f'{datetime_obj.minute:02d}',
            'description': description,
            'color': color,
        }
    