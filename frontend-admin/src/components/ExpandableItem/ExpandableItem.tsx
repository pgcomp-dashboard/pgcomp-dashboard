import { useState } from "react";

const ExpandableItem = (props: any) => {
  const [open, setOpen] = useState(true);

  return props.render({ open, setOpen });
};

export default ExpandableItem;
