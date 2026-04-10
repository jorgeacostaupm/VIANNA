import { forwardRef } from "react";
import { Button } from "antd";

import {
  APP_BUTTON_VARIANTS,
  resolveButtonVariantClassName,
} from "./buttonVariants";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

const AppButton = forwardRef(function AppButton(
  {
    variant = APP_BUTTON_VARIANTS.UNSTYLED,
    className,
    ...buttonProps
  },
  ref,
) {
  const variantClassName = resolveButtonVariantClassName(variant);

  return (
    <Button
      ref={ref}
      className={joinClassNames(variantClassName, className)}
      {...buttonProps}
    />
  );
});

export default AppButton;
