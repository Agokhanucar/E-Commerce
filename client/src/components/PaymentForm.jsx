import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateCardDetailsAction } from "../Redux/Actions/Payment";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";

const PaymentForm = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    focus: "",
  });

  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    let error = "";
    switch (name) {
      case "number":
        if (!/^\d{16}$/.test(value)) {
          error = "Card number must be 16 digits";
        }
        break;
      case "expiry":
        if (!/^\d{2}\/\d{2}$/.test(value)) {
          error = "Expiry must be in MM/YY format";
        }
        break;
      case "cvc":
        if (!/^\d{3}$/.test(value)) {
          error = "CVC must be 3 digits";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (evt) => {
    const { name, value } = evt.target;
    const newState = { ...state, [name]: value };
    setState(newState);

    const error = validate(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

    if (!error) {
      dispatch(updateCardDetailsAction(newState));
    }
  };

  const handleInputFocus = (evt) => {
    setState((prev) => ({ ...prev, focus: evt.target.name }));
  };

  return (
    <div>
      <Cards
        number={state.number}
        expiry={state.expiry}
        cvc={state.cvc}
        name={state.name}
        focused={state.focus}
      />
      <form>
        <input
          type="text"
          name="number"
          placeholder="Card Number"
          value={state.number}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {errors.number && <span className="error">{errors.number}</span>}
        <input
          type="text"
          name="expiry"
          placeholder="Expiry"
          value={state.expiry}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {errors.expiry && <span className="error">{errors.expiry}</span>}
        <input
          type="text"
          name="cvc"
          placeholder="CVC"
          value={state.cvc}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {errors.cvc && <span className="error">{errors.cvc}</span>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={state.name}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
      </form>
    </div>
  );
};

export default PaymentForm;
