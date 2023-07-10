import pandas as pd
import pickle

#load test data
X_test_rf = pd.read_csv("C:/Users/Yared/Downloads/Untitled spreadsheet - Sheet1.csv")
X_test_rf = X_test_rf.drop('Unnamed: 0',axis=1)

# load saved model
with open("C:/Users/Yared/Downloads/SAGE prediction Models/rf_model" , 'rb') as f:
    model_rf = pickle.load(f)
    
# inference power and 
y_pred_rf = model_rf.predict(X_test_rf)
# col 1 = power(w), col 2 = runtime(sec)
print("RF y_test :",y_pred_rf)


print("done!!!!!!")