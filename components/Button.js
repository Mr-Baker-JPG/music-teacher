import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const Button = ({ title, className, onClick, icon = false }) => {
  return (
    <button
      type="button"
      className={` btn  ${className}`}
      title={title}
      onClick={onClick}
    >
      {icon ? <FontAwesomeIcon icon={icon} /> : title}
    </button>
  )
}

export default Button
