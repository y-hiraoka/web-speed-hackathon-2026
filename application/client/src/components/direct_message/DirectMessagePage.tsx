import {
  memo,
  useCallback,
  useId,
  useRef,
  KeyboardEvent,
  FormEvent,
  useEffect,
} from "react";

import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";
import { DirectMessageFormData } from "@web-speed-hackathon-2026/client/src/direct_message/types";
import { getProfileImagePath } from "@web-speed-hackathon-2026/client/src/utils/get_path";

const timeFormatter = new Intl.DateTimeFormat("ja", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const MessageItem = memo(({ message, isActiveUserSend }: { message: Models.DirectMessage; isActiveUserSend: boolean }) => (
  <li
    className={`flex w-full flex-col ${isActiveUserSend ? "items-end" : "items-start"}`}
  >
    <p
      className={`max-w-3/4 rounded-xl border px-4 py-2 text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap ${isActiveUserSend ? "bg-cax-brand text-cax-surface-raised rounded-br-sm border-transparent" : "border-cax-border bg-cax-surface text-cax-text rounded-bl-sm"}`}
    >
      {message.body}
    </p>
    <div className="flex gap-1 text-xs">
      <time dateTime={message.createdAt}>
        {timeFormatter.format(new Date(message.createdAt))}
      </time>
      {isActiveUserSend && message.isRead && (
        <span className="text-cax-text-muted">既読</span>
      )}
    </div>
  </li>
));
MessageItem.displayName = "MessageItem";

interface Props {
  conversationError: Error | null;
  conversation: Models.DirectMessageConversation;
  activeUser: Models.User;
  isPeerTyping: boolean;
  isSubmitting: boolean;
  onTyping: () => void;
  onSubmit: (params: DirectMessageFormData) => Promise<void>;
}

export const DirectMessagePage = ({
  conversationError,
  conversation,
  activeUser,
  isPeerTyping,
  isSubmitting,
  onTyping,
  onSubmit,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textAreaId = useId();

  const peer =
    conversation.initiator.id !== activeUser.id ? conversation.initiator : conversation.member;

  const handleInput = useCallback(() => {
    onTyping();
  }, [onTyping]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [formRef],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const textarea = textAreaRef.current;
      if (!textarea) return;
      const body = textarea.value.trim();
      if (body.length === 0) return;
      textarea.value = "";
      void onSubmit({ body });
    },
    [onSubmit],
  );

  // Scroll to bottom once after messages render, without continuous ResizeObserver
  useEffect(() => {
    // Use requestAnimationFrame to wait for layout to settle
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    return () => cancelAnimationFrame(rafId);
  }, [conversation.messages.length]);

  if (conversationError != null) {
    return (
      <section className="px-6 py-10">
        <p className="text-cax-danger text-sm">メッセージの取得に失敗しました</p>
      </section>
    );
  }

  return (
    <section className="bg-cax-surface flex min-h-[calc(100vh-(--spacing(12)))] flex-col lg:min-h-screen">
      <header className="border-cax-border bg-cax-surface sticky top-0 z-10 flex items-center gap-2 border-b px-4 py-3">
        <img
          alt={peer.profileImage.alt}
          className="h-12 w-12 rounded-full object-cover"
          decoding="async"
          height={48}
          loading="lazy"
          src={getProfileImagePath(peer.profileImage.id)}
          width={48}
        />
        <div className="min-w-0">
          <h1 className="overflow-hidden text-xl font-bold text-ellipsis whitespace-nowrap">
            {peer.name}
          </h1>
          <p className="text-cax-text-muted overflow-hidden text-xs text-ellipsis whitespace-nowrap">
            @{peer.username}
          </p>
        </div>
      </header>

      <div className="bg-cax-surface-subtle flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-8">
        {conversation.messages.length === 0 && (
          <p className="text-cax-text-muted text-center text-sm">
            まだメッセージはありません。最初のメッセージを送信してみましょう。
          </p>
        )}

        <ul className="grid gap-3" data-testid="dm-message-list">
          {conversation.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isActiveUserSend={message.sender.id === activeUser.id}
            />
          ))}
        </ul>
      </div>

      <div className="sticky bottom-12 z-10 lg:bottom-0">
        {isPeerTyping && (
          <p className="bg-cax-surface-raised/75 text-cax-brand absolute inset-x-0 top-0 -translate-y-full px-4 py-1 text-xs">
            <span className="font-bold">{peer.name}</span>さんが入力中…
          </p>
        )}

        <form
          className="border-cax-border bg-cax-surface flex items-end gap-2 border-t p-4"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <div className="flex grow">
            <label className="sr-only" htmlFor={textAreaId}>
              内容
            </label>
            <textarea
              id={textAreaId}
              ref={textAreaRef}
              className="border-cax-border placeholder-cax-text-subtle focus:outline-cax-brand w-full resize-none rounded-xl border px-3 py-2 focus:outline-2 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue=""
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSubmitting}
            />
          </div>
          <button
            className="bg-cax-brand text-cax-surface-raised hover:bg-cax-brand-strong rounded-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            <FontAwesomeIcon iconType="arrow-right" styleType="solid" />
          </button>
        </form>
      </div>
    </section>
  );
};
