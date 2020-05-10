import React from 'react';
import './App.css';
import Form from "./lib/Form";
import TextInput from "./inputs/TextInput";
import NumberInput from './inputs/NumberInput';
import DateInput from './inputs/DateInput';
import ChoiceInput from './inputs/ChoiceInput';
import LeftRightInput from "./inputs/LeftRightInput";


const makeForm = Form.install({
  text: TextInput,
  number: NumberInput,
  date: DateInput,
  choice: ChoiceInput,
  left_right: LeftRightInput,
})

type Data = {
  name: string,
  age: number,
  birthday: Date,
  ["plus-one"]: string,
  ["left?"]: string,
  option: string,
}

const TestForm = makeForm<Data>([
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
  , type: "choice"},
  { name: "left?", label: "Left?"
  , default: "left"
  , type: "left_right"
  },
  { name: "option", label: "Option"
  , type: "text"
  }
], { name: "test", startActive: true } )

function App() {
  const [handle] = React.useState({} as any);

  const [validation] = React.useState( initialValidation as any)

  const [hide, setHide] = React.useState(false);


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
              name: async (data) => {
                  return data.name.length > 5;
              },
              birthday: [async (data) => {
                  if(data["plus-one"] === "yes") {
                    return true
                  }
                  return false
              }, ["plus-one"] ]

            }}
            validation={validation}
            hide={{
              option: async (data) => {
                return hide;
              },
              name: async (data) => hide,
            }}
          ></TestForm>
          <button
            onClick={() => {
              setHide((hide) => !hide);
            }}
          >Click to hide/show the option field</button>
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
    }, ["age"]],
}