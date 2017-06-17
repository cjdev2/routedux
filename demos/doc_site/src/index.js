import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './model';
import App from './App';
import './index.css';

function Root() {
  return (
    <Provider store={store}>
        <App />
    </Provider>
  );
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
