import { useState } from "react";
import { Modal } from "react-bootstrap";

export default function InfoModal({ show, onClose }: any) {
  const [fullscreen, setFullscreen] = useState(false);

  const handleClose = () => onClose();
  const handleMaximize = () => setFullscreen(!fullscreen);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      fullscreen={fullscreen as any}
    >
      <Modal.Header>
        <img
          src="/images/modal/blank-button.svg"
          alt="Blank Button"
          width={20}
          height={20}
        />
        <div className="lines"></div>
        <div className="rightWrapper">
          <button
            onClick={handleClose}
            className="no-style btn-minimize"
          ></button>
          <button
            onClick={handleMaximize}
            className="no-style btn-maximize"
          ></button>
          <button
            onClick={handleClose}
            className="no-style btn-closing"
          ></button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <img
          src="/images/phone.png"
          alt="Motorola Flip Phone"
          width={199}
          height={470}
          className="phone"
          priority={true}
        />
        <h4>
          One tap trading at it's finest. Predict where a chart is heading,
          tap to bet for a chance to win bananas.
          <br />
          Lots of bananas.
        </h4>
      </Modal.Body>
    </Modal>
  );
} 