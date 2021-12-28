import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Alert, Row, Col } from 'reactstrap';
import { AvForm, AvField, AvGroup, AvInput } from 'availity-reactstrap-validation';
import { Link } from 'react-router-dom';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { LoginForm, Button as AButton } from '@rlin001/store-story-book-demo';

export interface ILoginModalProps {
  showModal: boolean;
  loginError: boolean;
  handleLogin: (username: string, password: string, rememberMe: boolean) => void;
  handleClose: () => void;
}

const LoginModal = (props: ILoginModalProps) => {
  const handleSubmit = (event, { loginValue: username, pwdValue: password, rememberMe=false }) => {
    const { handleLogin } = props;
    // eslint-disable-next-line no-console
    console.log("username, password, rememberMe", username, password, rememberMe);
    handleLogin(username, password, rememberMe);
  };

  const handleReset = (event, { username, password, rememberMe=false }) => {
  }

  const { loginError, handleClose } = props;
  // eslint-disable-next-line no-console
  console.log("LoginForm", LoginForm, typeof LoginForm, typeof Link);
  return (
    <Modal isOpen={props.showModal} toggle={handleClose} backdrop="static" id="login-page" autoFocus={false}>
      <AvForm onSubmit={handleSubmit}>
        <ModalBody>
          <LoginForm
            reset={ handleReset}
            submit={ handleSubmit }
            title='login'
            style={{
              textAlign: 'center'
            }}
          />
        </ModalBody>
      </AvForm>
    </Modal>
  );
}

export default LoginModal;
