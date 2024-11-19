const InputPriceComponent = ({ onChange, value }) => {

    return (
        <div className="text-center mb-2">
            <input className='text-center bg-gray-700 w-60 p-2 rounded-lg text-white'
                type="number"
                name="drop1234"
                placeholder="Ej: $350.000"
                value={value}
                onInput={(e) => {
                    const value = e.target.value.slice(0, 9);
                    e.target.value = value.replace(/\D/g, '');
                    onChange(e); 
                }}
                onChange={onChange} />
        </div>
    );
};

export default InputPriceComponent;