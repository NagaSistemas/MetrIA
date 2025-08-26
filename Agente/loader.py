import pandas as pd

def load_qa_from_csv(path):
    df = pd.read_csv(path)
    return df
