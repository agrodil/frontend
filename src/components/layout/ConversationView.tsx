import type { FC } from "react";

interface ConversationViewProps {
  propName: string;
}

const ConversationView: FC<ConversationViewProps> = ({ propName }) => {
  return (
    <div>
      <h1>ConversationView Component</h1>
      <p>Prop: {propName}</p>
    </div>
  );
};

export default ConversationView;
