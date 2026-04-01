import { Buffer } from "buffer";
import $ from "jquery";

(window as unknown as Record<string, unknown>).jQuery = $;
(window as unknown as Record<string, unknown>).$ = $;
(globalThis as unknown as Record<string, unknown>).Buffer = Buffer;
