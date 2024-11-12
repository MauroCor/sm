const InputComponent = ({ name, value, onChange, placeholder, className }) => {
    return (
        <div className="flex flex-col">
            <label className="text-xs text-left mb-1 ml-10">{name}</label>
            <div className="text-center mb-2">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`bg-gray-700 w-60 ${className}`}
                />
            </div>
        </div>
    );
};

export default InputComponent;
