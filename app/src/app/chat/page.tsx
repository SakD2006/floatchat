import Chat from "@/components/Chat/Chat";
import { ChatErrorBoundary } from "@/components/Chat/ChatErrorBoundary";

export default function ChatPage() {
  return (
    <div className="w-full h-full max-w-6xl mx-auto">
      <div className="h-full flex flex-col">
        <ChatErrorBoundary>
          <Chat />
        </ChatErrorBoundary>
      </div>
    </div>
  );
}
