const initialState = {
  number: '',
  expiry: '',
  cvc: '',
};

const paymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_CARD_DETAILS':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default paymentReducer;
