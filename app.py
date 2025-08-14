from flask import Flask, request, flash, render_template
from utils import *
import os

app = Flask(__name__)
app.secret_key = '1'

UPLOAD_FOLDER = 'data'
ALLOWED_EXTENSION = 'csv'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename: str):
    if os.path.exists('{direc}/{filename}'.format(**{ 'direc': UPLOAD_FOLDER, 'filename': filename })):
        return False
    
    elif filename.endswith('.csv'):
        return True
    
    return True


@app.route('/', methods=['GET', 'POST'])
def index():
    return { 'message': 'welcome to finance tracker application' }

@app.route('/upload', methods=['POST'])
def upload_csv():
    if request.method == 'POST':
        if 'file' not in request.files:
            return { "error": "no files uploaded" }
        
        file = request.files['file']
        
        if file and allowed_file(filename=file.filename):
            filename = file.filename

            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            flash('file uploaded successfully')

            return { "message": "uploaded file" }

        return { "error": "File Error" }

@app.route('/home', methods=['GET'])
def render_home_page():
    return render_template('index.html')

@app.route('/statistics', methods=['POST'])
def compute_statistics():
    if request.method == 'POST':
        req = request.get_json()
        file_name =  req['name']


        if not file_name:
            return { "error": "filename not found in request"}

        dir_path = 'data/{file_name}'.format(file_name=file_name)
        if os.path.exists(dir_path):
            total_credit = extract_total_credit(path=dir_path)
            total_debit = extract_total_debit(path=dir_path)
            cat_distro = category_wise_dstrn(path=dir_path)
            
            return {
                "totalCredit": total_credit,
                "totalDebit": total_debit,
                "distribution": cat_distro
            }
        else:
            return { "error": "file not found" }
        
if __name__ == "__main__":
    app.run('localhost', 3030, debug=True)