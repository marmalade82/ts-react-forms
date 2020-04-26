import React from 'react';
import './App.css';
import Form from "./lib/Form";
import TextInput from "./inputs/TextInput";
import NumberInput from './inputs/NumberInput';
import DateInput from './inputs/DateInput';
import ChoiceInput from './inputs/ChoiceInput';


const makeForm = Form.install({
  text: TextInput,
  number: NumberInput,
  date: DateInput,
  choice: ChoiceInput,
})

const TestForm = makeForm([
  { name: "name", label: "Name"
  , type: "text"
  , default: "apple" },
  { name: "age", label: "Age"
  , default: 0
  , type: "number" },
  { name: "birthday", label: "Birthday"
  , default: new Date()
  , type: "date" },
  { name: "plus-one", label: "Plus One?"
  , default: "no"
  , type: "choice"}
], "test", true)

function App() {
  const [readonly, setReadonly] = React.useState(false);
  const [handle] = React.useState({} as any);
  return (
    <div id={"app"} className="App"
    >
        <TestForm
          handle={handle}
          choices={{
            "plus-one": [
              {label: "Yes", value: "yes", key: "yes"},
              {label: "No", value: "no", key: "no"}
            ]
          }}
          readonly={{
            name: async (data: any) => {
                return data.name.length > 5;
            },
            birthday: [async (data: any) => {
                if(data["plus-one"] === "yes") {
                  return true
                }
                return false
            }, ["plus-one"] ]

          }}
          validation={{ 
            name: async (data: any) => {
              if(data.name.length > 0) {
                return ["ok", ""]
              }
              return ["error", "oops"];
            },
            birthday: async (data: any) => {
              if(data.birthday < new Date()) {
                return ["error", "oops"]
              }
              return ["ok", ""]
            },
            age: async (data: any) => {
              if(data.age > 100) {
                return ["error", "oops"]
              }
              return ["ok", ""]
            },
            "plus-one": [async (data: any) => {
              if(data.age < 10 && data["plus-one"] === "no") {
                return ["error", "Minors must be accompanied by an adult"]
              }
              return ["ok", ""];
            }, ["age"]]
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
