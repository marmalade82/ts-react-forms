import React from 'react';
import './App.css';
import Form from "./lib/Form";
import TextInput from "./inputs/TextInput";


const makeForm = Form.install({
  text: TextInput,
})

const TestForm = makeForm([
  { name: "name", label: "Name"
  , type: "text"
  , default: "" }
], "test")


function App() {
  const [readonly, setReadonly] = React.useState(false);
  const [handle] = React.useState({} as any);
  return (
    <div id={"app"} className="App"
    >
        <TestForm
          handle={handle}
          choices={{}}
          readonly={{
            name: ((readonly) => {
                return async (data: any) => {
                  return data.name.length > 5;
              }
            })(readonly)
          }}
          validation={{ 
            name: async (data: any) => {
              if(data.name.length > 0) {
                return ["ok", ""]
              }
              return ["error", "oops"];
            }
          }}
        ></TestForm>
        <button
          onClick={() => {
            setReadonly(!readonly)
            handle.setActive(!readonly);
          }}
        >Click</button>
    </div>
  );
}

export default App;
