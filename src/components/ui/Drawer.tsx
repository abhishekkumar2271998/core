"use client";

import { Modal, type ModalProps } from "./Modal";

interface DrawerProps extends Omit<ModalProps, "placement" | "size"> {
  side?: "left" | "right" | "bottom";
  size?: "sm" | "md" | "lg";
}

/** Side sheet / bottom sheet. Shares focus trapping, Escape and scroll lock with `Modal`. */
export function Drawer({ side = "right", size = "sm", ...props }: DrawerProps) {
  return <Modal placement={side} size={size} {...props} />;
}
