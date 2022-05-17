import Constants from "./Constants";

const Utility = {
    MouseOver: (event, type) => {
        if (event.target.type === type) {
            event.target.style.backgroundColor = Constants.colors.lighter_theme;
        }
    },
    MouseOut: (event, type) => {
        if (event.target.type === type) {
            event.target.style.backgroundColor = Constants.colors.theme;
        }
    }
};

export default Utility;