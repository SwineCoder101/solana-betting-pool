import './outlined-text-styles.css'

type Props = {
  title: string
}

export function OutlinedText({ title }: Props) {
  return <span className="test [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">{title}</span>
}
