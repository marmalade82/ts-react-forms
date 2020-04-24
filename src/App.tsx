import React from 'react';
import './App.css';
import Form from "./lib/Form";
import TextInput from "./inputs/TextInput";


Form.install({
  text: TextInput
})


function App() {
  return (
    <div id={"app"} className="App">
    </div>
  );
}

export default App;
