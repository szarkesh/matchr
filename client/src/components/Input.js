function Input(props) {
  return (
    <div className={props.className}>
      {props.labelText && (
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          {props.labelText}
        </label>
      )}
      <input
        {...props}
        onWheel={(e) => e.target.blur()}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      ></input>
    </div>
  );
}

export default Input;
