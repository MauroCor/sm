const ButtonComponent = ({ onClick, text, className }) => {
    return (
        <button
            onClick={onClick}
            className={className}>
            {text}
        </button>
    );
};

export default ButtonComponent;
