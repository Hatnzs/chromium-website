---
breadcrumbs:
- - /developers
  - For Developers
- - /developers/design-documents
  - Design Documents
- - /developers/design-documents/sync
  - Sync
page_name: sync-data-best-practices
title: Sync Data Best Practices
---

### Changing fields in specifics

[The new sync API](/developers/design-documents/sync/syncable-service-api) uses
protobufs to communicate with Chrome services, which is nice because protobufs
were written to be robust against protocol changes (see [protobuf
docs](http://code.google.com/apis/protocolbuffers/docs/overview.html) for
details). However, once you start syncing data, changing your protobuf format
isn't completely painless; not only can sync users upgrade from one Chrome
version to another, but they may have different Chrome versions running at the
same time! Fortunately, there are some best practices to help make it easy:

*   Avoid using "explicit version numbers" in your protobuf; instead,
            have your code test for the existence of a field to determine what
            to do. Protobufs were written precisely to avoid version-specific
            logic, and testing for fields is more robust.
*   Adding a new field is the simplest case. Old clients will simply
            ignore the unknown new field, and when old clients send up new data,
            the sync backend preserves unknown fields so new clients can still
            use them.
*   Removing an old field is also pretty simple. Simply stop populating
            the field. Old clients will continue to use it, and new clients will
            ignore it. Once the Chrome stable version moves past the last
            version to use the old field, (where "moves past" means something
            like "the number of users using a version of Chrome older than the
            stable version drops below 1%) then you can remove the field
            entirely via a server-side map-reduce.
*   Avoid repurposing existing fields. Instead, add a new field for the
            new data and stop populating the old field, although continue to
            read it if the new field isn't present. Then, when the stable
            version of Chrome moves past the last version that creates old data,
            add code to migrate the old field to the new field (preferably on
            the server side, as adding substantial migration code might cause
            sync traffic spikes on version upgrades). Finally, once the stable
            version of Chrome becomes the first Chrome version with the
            migration code, you can remove data in the old field.

### Conflict resolution

A conflict can occur when an entity has a pending local commit and an update for
the same entity comes from another client during an incremental update. There is
a default implementation of conflict resolution which is sufficient in most
cases. However it's possible to provide in the bridge a custom
[`ResolveConflict`][ResolveConflict] implementation. The result can be either
keeping the local pending change, or fully apply the remote update. Note that
currently merging is not supported during the conflict resolution.

It is recommended to avoid any additional logic to detect conflicts or merge
local data with remote updates. This may lead to inconsistency between the
client and the server, and hence between different clients. Re-uploading of such
merged data should also be avoided because it may result in a ping-pong issue
when two different clients would indefinitely reupload merged results of each
other.

[ResolveConflict]: https://cs.chromium.org/search/?q=ResolveConflict+file:/data_type_sync_bridge.h

### Avoiding ping-pong

**tl;dr**: Do not call `change_processor()->Put(..)` in your
`ApplyIncrementalSyncChanges` implementation! In other words, an incoming sync
update must never directly lead to an outgoing update.

Sometimes, incoming changes from the server can be "bad" in some way - for
example, some older version of Chrome committed invalid or incomplete data. In
such cases, it's tempting to fix the data, by committing a "fixed" version
directly when receiving the "bad" data in `ApplyIncrementalSyncChanges`.

However, doing this can lead to "ping-pong" issues: If two clients try to fix
bad data, but disagree on what the correct state is, they'll continuously
re-update the same entity back and forth, as fast as their network connections
allow. If enough clients get into this state, this amounts to a DDoS attack on
the sync server. \
Note that it's effectively impossible to ensure that no *past or future* Chrome
version disagrees with your current code's behavior.

Instead, it's usually best to fix up the data locally *without* committing it,
and relying on the next natural change to commit the fixed data to the server.
If you absolutely must re-upload the fixed data, this must be rate-limited in
some way, e.g. do it at most once per browser startup.
