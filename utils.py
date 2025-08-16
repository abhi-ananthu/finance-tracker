import pandas as pd

def extract_total_credit(path: str):
    
    df = pd.read_csv(path)
    np_credit =  df[df['amount'] < 0]
    credit_sum = pd.to_numeric(np_credit['amount'], errors='coerce').sum()
    return float(round(credit_sum, 2))

def extract_total_debit(path: str):
    
    df = pd.read_csv(path)
    np_credit =  df[df['amount'] >= 0]
    credit_sum = pd.to_numeric(np_credit['amount'], errors='coerce').sum()
    return float(round(credit_sum, 2))


def category_wise_dstrn(path: str):

    df = pd.read_csv(path)
    sum_series = df.groupby('category')['amount'].sum()


    return sum_series.to_dict()

def credit_labels(path: str):
    df = pd.read_csv(path)
    cat_series = df[df['amount'] < 0][['category']]

    return cat_series.to_json()

def debit_labels(path: str):
    df = pd.read_csv(path)
    cat_series = df[df['amount'] < 0][['category']]

    return cat_series.to_json()
