from keras.datasets import mnist
import matplotlib.pyplot as plt

#download mnist data and split into train and test sets
(X_train, y_train), (X_test, y_test) = mnist.load_data()
#plot the first image in the dataset
print(X_train[0].shape)


