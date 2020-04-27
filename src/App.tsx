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
  , default: "" },
  { name: "age", label: "Age"
  , default: 0
  , type: "number" },
  { name: "birthday", label: "Birthday"
  , default: new Date()
  , type: "date" },
  { name: "plus-one", label: "Plus One?"
  , default: "no"
  , type: "choice"}
], { name: "test", startActive: true } )

function App() {
  const [handle] = React.useState({} as any);

  const [validation] = React.useState( initialValidation as any)



  return (
    <div id={"app"} className="App"
    >
      <div className="container">
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
            validation={validation}
          ></TestForm>
          <button
            onClick={() => {
              handle.setActive(!handle.getActive());
            }}
          >Click to enable/disable logic</button>
      </div>
    </div>
  );
}

export default App;


const initialValidation = {
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
}