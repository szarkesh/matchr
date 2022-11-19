function Button(props) {
  const color = props.disabled ? "gray" : props.color || "red";
  const size = props.size || "md";
  return (
    <button
      {...props}
      className={
        props.disabled
          ? "text-white bg-gray-500 font-medium rounded-lg text-sm px-5 py-2.5"
          : "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      }
    >
      {props.children}
    </button>
  );
}

export default Button;
