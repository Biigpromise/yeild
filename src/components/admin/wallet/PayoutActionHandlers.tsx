
import React from "react";

type PayoutActionHandlersProps = {
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  children: React.ReactElement;
};

export const PayoutActionHandlers: React.FC<PayoutActionHandlersProps> = ({
  onApproveRequest,
  onRejectRequest,
  children
}) => {
  // Clone the child and pass the handlers as props
  return React.cloneElement(children, {
    onApprove: onApproveRequest,
    onReject: onRejectRequest,
  });
};
