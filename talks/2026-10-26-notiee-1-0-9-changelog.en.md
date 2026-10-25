the last time i wrote a notiee changelog was 1.0.5. at the end of that one i said notiee would meet everyone in the middle of summer. summer is over now, and meeting everyone turned into: 1.0.9 is more or less the whole app rebuilt.

from 1.0.6 to now it's been a little over three months: 87 commits, 725 files, 78,863 lines added and 28,885 removed, 132 new Swift files and 39 deleted. four tabs became two places, the camera and editor were rebuilt, Notti was renamed and overhauled, recording is new, and the free app went from "bring your own AI key" to "sign in and it works". too much is worth saying, so i'll stick to the big pieces.

## four tabs became two places

notiee used to open on four tabs: Today, Snap, Records, Spark — four entrances for four things. after using it for a while i noticed i had to spend a second every time deciding what i was here to do and which one to tap.

now there are only Today and Records, with a permanent dock between them: Today on the left, "ask Notti…" in the center, records on the right. to shoot, pull down on Today and the viewfinder peels down from the top of the screen; to record, push up and the recorder rises from the bottom. no hunting for a button first. the iOS 18 camera control button is wired up too — one press opens the capture camera from wherever you are.

Records is a real two-column waterfall now, and the big "Records" title is itself a scope menu (all, favorites, uncategorized, today's captures, to process, trash), plus five source filters — all / photo / audio / text / from Notti. the detail page is image-first: if a record has photos, they start at the very top of the screen.

i deleted the entire old four-tab interface, along with the old settings page and a whole set of old components. when two interfaces exist side by side, the same feature behaves differently in two places, and those bugs are miserable to fix, so i kept only the new one.

## Today speaks first

the new home screen puts its weight on the big type at the top of Today. it used to be a fixed welcome card; now it's a window onto "the one thing worth saying right now", and Notti decides what that is: a schedule collision within two hours, a todo that's overdue or due soon, an event starting within thirty minutes, a topic AI found in the last 14 days of records — and if none of those apply, a welcome line for the time of day.

it shows one thing at a time and never auto-rotates. tapping it carries the source into Notti so you don't have to restate the context. if an event is happening right now, a brand-green aurora flows across the top of Today (on Metal, 30fps) and stops when you switch pages or leave the app.

my favorite part of the design is that it must have a real source: an AI topic has to point at an actual record, event or todo, and if that source gets deleted, encrypted or expires, the topic is pulled immediately. it doesn't get to invent "you seem busy lately" and feed it to me.

## the camera got rebuilt

the camera is basically a rewrite. automatic scene categories are gone, along with document / whiteboard / outdoor modes and that explanatory "more" menu. what's left is what you actually use:

- 4:3 by default, so the viewfinder matches the final photo;
- zoom presets are no longer hardcoded 0.5× / 1× / 2× — they're generated from the lenses and zoom ranges the device actually has, so a single-camera phone no longer shows an ultrawide that doesn't exist;
- tap-to-focus actually sets focus on the device now, instead of just drawing a box;
- live photos are a real still plus a paired MOV — long-press to play in the detail page, and the metadata comes along when you save to Photos;
- bursts go up to 9 frames and only end when you tap "done (N)"; leaving mid-burst lets you save, discard or keep shooting, and an unfinished burst comes back on next launch.

in labs there's a "photo metadata and location" switch, off by default. while it's off, photos saved to your library lose optional EXIF and GPS and keep only orientation, color and the live-photo marker; turn it on and notiee records a one-time foreground location snapshot, valid for 60 seconds. photos imported from your library never get the phone's current location substituted for where they were actually taken.

## Notti: renamed from Spark, and a lot bigger

Spark is officially Notti now. the scary part of a rename is losing data, so the first launch after upgrading runs a migration: conversation drafts, history, long-term memory, chat style and model settings all move under the Notti name, written file by file atomically and read back for verification. if any step fails it rolls back and keeps the old files. the persisted identifiers still use the old values, so an older version can still recognise record ownership and the "Spark generated" folder.

the answers themselves changed a lot too:

- real streaming: the model generates while the interface renders, instead of waiting for the whole answer and playing it back like a typewriter;
- sources under each answer — N records and M web pages — opening into a source sheet where records jump to their detail and web pages open inside the app;
- empty conversations suggest up to 3 starter questions; coming in from a Today topic gives you 3 follow-up angles on that topic instead;
- a collapsed execution summary above the answer shows what it did step by step and how long it took, and the todos and events involved in that turn are listed as cards below;
- it can write a real Markdown document, producing a document card you can preview, copy, share or add to a record; you can send images in chat too;
- the Agent is no longer a switch — Notti decides whether to answer or act, and free-tier Leaf accounts get web search and on-demand memory retrieval;
- context opened up: the free version used to keep 200 characters per message and only the last 5 turns; now recent messages stay whole with a 128K default budget, and once you're near 85% the older conversation is compressed into a factual summary. the old "force a new conversation after 20 turns" rule is gone too.

## it starts remembering you

long-term memory lives under "memory" in the sidebar. after each successful answer your message joins a persistent queue, and when things are idle it gets extracted into memories; only proposals backed by verbatim evidence are accepted, and keys, verification codes and card numbers are rejected outright. memories fall into seven categories and fade by durability, and recall combines four signals: semantic vectors, keywords, entity hits and explicit time.

everything is encrypted on device (AES-GCM, key in the keychain) and never synced to iCloud. health, precise addresses, contact details, finances and identity go to "pending confirmation" by default — they only count once you confirm. free-tier Leaf and Folio no longer inject a fixed number of memories every turn; Notti searches for them when it needs them. Notiee+ keeps the old bounded injection.

## Notti emergence

the round button at the bottom of the detail page used to open a placeholder list. it's called "Notti emergence" now, and it does one thing: find connections to this note that you might have forgotten.

it starts with candidates from your local records across time and folders. a candidate has to share a real theme with the current note and have evidence in its body; same event or same folder only nudges the ranking, it isn't enough on its own. at most 4, and an empty result is fine. only when you tap "find new connections" does it call AI, producing up to 3 new connections — each one must cite the real ID and a verbatim excerpt from this note and at least one other note; made-up or badly formatted ones are thrown away.

two things i insisted on: an AI discovery is only a "guess" by default, saved as its own new note marked as a guess and linked back to its sources, never editing the note you started from; and it doesn't search the web or run any tools — it only looks inside your own records.

## recording: pull up and go

recording starts from the pull-up on Today. microphone permission is only requested after you let go, and if you decline it says so clearly instead of pretending to record.

recording transcribes live on device by default, and audio isn't uploaded; if the device doesn't support on-device recognition it just records, and never quietly falls back to the cloud. the hard limit is 30 minutes, pauses don't count, and timing uses a monotonic clock so changing the system date doesn't affect it. a crash or force-quit leaves a small manifest and the next launch recovers the recording. on stop, the M4A is finalized locally and written into the record before transcription or organizing starts — so no failure in that chain can roll the recording back.

playback got speed control and transcript linking: tap any line of the transcript to jump to that moment, and after a little scrolling the player folds into a compact sticky bar.

the free app can turn on advanced transcription (Doubao ASR) after signing in, with speaker turns and punctuation. Leaf gets 2 hours total, Folio gets 20 hours a month, metered separately from the AI allowance. a "Notti flash" card under the recording organizes key points from the confirmed transcript in real time; that one is Folio only. Notiee+ has none of the cloud pieces and always uses on-device recognition.

## a record is a title plus a free body

editing a record used to mean separate fields for summary, detailed content, key points and terms. now there's one native editor: a title on top, one continuous free body below, and an always-visible formatting toolbar, with autosave 600ms after you stop typing and a constant "saved / unsaved" under the title.

if you were already writing the body by hand when AI organization kicks in, the AI result only goes into the toolbar as an "AI candidate" — it replaces anything only when you tap "use this body", so it never quietly overwrites you. organization itself became a single model call that produces title, summary, body and todos, instead of "OCR first, then another model rewrites it"; nothing is committed unless strict validation passes, and an interruption leaves a retryable unfinished preview. you can leave the app while it works, and it resumes on next launch.

the body is parsed with swift-markdown. tables, images, formulas and HTML can't be visual for now, so they're preserved as editable "raw content blocks" instead of being swallowed. a record can carry multiple attachments, and storage moved to a single SQLite file — the old JSON is encrypted and backed up with a keychain key before migration, and only deleted after read-back verification and a committed transaction.

there's also a screenshot shortcut: without opening the app, a screenshot becomes a capture waiting to be organized, and you get a notification when it's done.

## the free app has accounts and an allowance now; subscriptions are paused for the moment

this is the biggest change and the one that needs its own section. Notiee+ is still a one-time purchase with your own model key and a local account. the free app now talks to my backend, so you sign in and go.

the account is an email plus a 6-digit code, no password. sign-in and sign-up share one path, and the client never probes whether an email is registered. Apple sign-in is supported, and after the first authorization you can attach an email — Apple's hidden one is fine. if that email already belongs to another account, it says so and doesn't merge anything. the app also offers account deletion, as App Review requires.

the allowance used to be "how many captures per month". now every AI feature shares one server-side, cost-weighted allowance — capture organization, Notti chat and Agent, recording organization, memory extraction, titles, context compression and successful web calls. the allowance card and the subscription & usage page show one percentage, the reset time and a breakdown by feature. a failed request isn't charged; successful results are cached encrypted on the server for 24 hours, so the same retry returns the original result without calling the model again or charging twice. the tiers are called Leaf and Folio now — the server identifiers and the product ID are unchanged, so existing subscribers don't need to buy again.

the free app's AI all goes through my own Go service now; model keys live only on the server, and users no longer need to bring a key. Notiee+ doesn't touch this backend and is still billed by your own model provider.

one more thing i want to be clear about: starting october 25, Folio is closed to new subscriptions. the usage page, the allowance card, restricted-model entry points, and the Folio mentions in Notti and recording all pop up a contact sheet now; the subscription page was rebuilt as an identity card plus a Leaf / Folio benefits comparison, with the purchase button at the bottom replaced by "contact me about Folio". existing subscriptions, restore purchases, entitlement delivery and refund notifications keep working — new users just can't buy for now. if you want a subscription or just want to talk, come find me. it'll open again when it's ready, and i'll say so.

## settings, icons, and some quieter things

settings went from nine categories to eight (seven on the free app), labs moved out of settings into the avatar drawer in the top-left corner, the old standalone "backup & restore" folded into data & sync, and notifications are on by default once the system grants permission. the all-events page got a month calendar you can page through, with new and import merged into one "+" menu; week numbers and semester weeks are gone.

visually there's a new set of simplified 3D skeuomorphic icons: 8 settings categories, 7 drawer entries and 8 Notti tools, 23 in total, rendered in their original colors. Liquid Glass is used only where it belongs — the dock, search field, toolbar capsules, content selector, camera controls and other floating layers; cards, body text and settings forms stay solid. iOS 26 gets native glassEffect, older systems fall back to Material, and "reduce transparency" turns it into solid plus a thin stroke.

empty states got 4 sets of 8 hand-drawn line illustrations; the welcome page, privacy page and the 26-second Stories intro are new too (the example in Stories never writes a record and never triggers AI). the launch screen went from a full-screen splash to a lightweight brand-mark bridge, and the minimum time on screen dropped from 1.2 seconds to 160ms. Reduce Motion, VoiceOver, dynamic type and reduce transparency got a pass too.

## legal, dependencies and things i fixed

the about page now carries the real ICP filing number: 湘ICP备2026027627号-1. the privacy policy moved to v1.0.8 and the user agreement to v1.0.7, both synced across four languages. four unused dependencies are gone, and swift-markdown was added.

of the bugs fixed, the ones i care most about: the camera hanging on cold start (the session was being configured more than once), the whole interface jumping up when the keyboard appeared, live captions not following content as it grew and no "back to live" after scrolling up, the volume waveform getting squashed by history, newly registered Leaf accounts having their first chat rejected as needing a subscription, and reinstalling sometimes showing the previous account's session and allowance.

## what's not done yet

an honest list of what's still missing:

- the camera has only been through automated verification and screenshots in the simulator; hands-on device acceptance isn't done. real lens switching, two-finger zoom feel, live photo recording and playback, tap-to-focus, EXIF and location, and exit performance all still need to be checked one by one on a real phone. if you hit a camera problem on TestFlight, please tell me.
- going back from 1.0.9 to 1.0.6 means the old version can't read new audio records; live photo records still show their still image, but live playback, location and other extras are lost; upgrading is compatible, downgrading isn't.
- .tmn backups include attachments, body and paired live-photo resources, but not recording audio files.
- recordings have no Live Activity or lock-screen controls yet, and speakers are just turn numbers within a session, not voice-print identification.
- iPad has no dedicated layout — a regular iPad still gets the phone layout; the free app doesn't expose model selection yet, and requests don't carry thinking parameters.
- the Agent's trust levels (cautious / standard / full trust) and execution budget have no settings screen in this build — the old operation-permissions page is gone, so they can't be changed for now, and some prompts still point at it.
- in the new interface, folder creation/management and encrypted record details still open the old screens, so the visuals aren't fully unified; tables and formulas in the editor still can't be edited visually, and SQLite paging and body lazy-loading are still planned.

these will get filled in over the next versions.

## the end

the last time i wrote a changelog i said notiee would meet everyone in the middle of summer. summer ended, it didn't make it to the App Store, but it grew itself a new shape.

the public beta for TestFlight 1.0.9 is open now — go to the [Notiee page](/works/notiee.html) to join this round. too much changed this time, and i want to know what's wrong more than usual — especially the camera, recording and Today. if something feels off, slow or confusing, tell me. the App Store is still "coming soon"; when there's news i'll write it here.

want to talk about Folio, or just want to chat? come find me on [bonjour!](https://bonjour.bio/idbetterrun).

thanks for reading this far.

idbetterrun
