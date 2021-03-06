import React from "react";
import { AudioNodeElement } from "../base/AudioNodeElement";

export const ConvolverComponent = props => (
  <AudioNodeElement
    disabled={props.disabled}
    bypassed={props.convolverNode && props.convolverNode.bypass}
    title={"Reverb"}
    id={"convolver"}
    setBypass={props.setBypass}
  />
);
