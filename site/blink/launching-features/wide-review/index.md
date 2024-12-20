---
breadcrumbs:
- - /blink
  - Blink (Rendering Engine)
- - /blink/launching-features
  - Launching Features
page_name: wide-review
title: Signals from other implementations in an intent-to-ship
---

TL;DR

Every intent-to-ship requires (*) an Implementation Signals List as part of the
“Interoperability and Compatibility” subsection for Gecko and WebKit only. Other
implementations/browsers are not required. For example, such a list for a
hypothetical feature might read:

> Gecko: Worth Prototyping (&lt;link to Mozilla standards position>)<br>
> WebKit: Support (&lt;link to WebKit standards position>)

These signals are reported for the purpose of giving a clear indication of the
views of those implementers. [Web Developers](https://goo.gle/developer-signals)
is yet another signal separate from an Implementation Signal, and is not less
important. As with other signals, the Implementation Signal is only one input
into the intent-to-ship process to take into consideration, and is neither a
veto nor an implicit approval to ship.

(*) Three notable exceptions:

*   If it is an ECMAScript feature that has reached
    [stage 3](https://tc39.es/process-document/).
*   If it is a WebAssembly feature that has reached
    [phase 4](https://github.com/WebAssembly/proposals/blob/master/README.md#phase-4---standardize-the-feature-wg).
*   It is a feature standardized by Khronos under its Working Group Guidelines,
    and the specification has been committed to the relevant Khronos standard &
    reflected on the Khronos website.
    ([documentation](https://groups.google.com/a/chromium.org/g/blink-api-owners-discuss/c/CVkhZNVPlSg))

In these exception cases, signals are not required.

## Details

For cases where the signal is not Shipping/Shipped or In Development, the
[Official Standards Signal Process](#signal-process) (see next section) for that
implementation should be followed to obtain a signal. If the Official Standards
SIgnal Process is skipped or incomplete and N/A or No Signal is reported, it
should be reported why. Reasons why can include:

*   Change is too small to justify this effort. Note that Mozilla in particular
    have
    [indicated](https://groups.google.com/a/chromium.org/g/blink-api-owners-discuss/c/q5C44gYgqyA/m/gJfUKuUqAgAJ)
    that they trust the judgment of blink API owners in determining when
    something is sufficiently small and/or non-controversial to bother
    requesting a position on.
*   The Official Standards Signal Process was followed but no response came in a
    reasonable timeframe

For each of Gecko and WebKit, state one of the following signals:

<table>
  <thead>
    <tr>
      <th>Signal
      <th>Required evidence
  </thead>
  <tr>
    <td>No Signal
    <td>Link to Official Standards Signal Process issue or thread that is not
    yet complete
  <tr>
    <td>Shipped/Shipping
    <td>Link to public documentation or bug/issue that demonstrates the issue
    has shipped (i.e., an issue that links to patches that have been merged, or
    a comment that a previously disabled feature is now enabled by default).
  <tr>
    <td>In Development
    <td>Link to public documentation or bug/issue clearly indicating feature is
    in development (not just filed as a bug or under consideration). When in
    doubt, follow the Official Standards Signal Process
  <tr>
    <td>Positive
    <td>Statement made through an Official Standards Signal Process for that
    implementation
  <tr>
    <td>Neutral
    <td>Statement made through an Official Standards Signal Process for that
    implementation
  <tr>
    <td>Negative
    <td>Statement made through an Official Standards Signal Process for that
    implementation
  <tr>
    <td>Defer
    <td>Statement made through an Official Standards Signal Process for that
    implementation
  <tr>
    <td>N/A
    <td>Indication of why an Official Standards Signal is not needed in this
    case
</table>

## Official Standards Signal Process {:#signal-process}

In all cases, a reasonable amount of time (at least one week, but ideally much
more) should be allowed for responses to this process.

### Gecko

[File a Mozilla standards position issue.](https://github.com/mozilla/standards-positions)
The
[possible outcomes](https://github.com/mozilla/standards-positions/blob/main/README.md)
of this are: **positive**, **neutral**, **negative**, **defer**, and **under
consideration**. Link to the issue in the Implementation Signals List.

### WebKit

[File a WebKit standards position issue](https://github.com/WebKit/standards-positions/),
and link to the issue in the Implementation Signals List. The
[possible outcomes](https://github.com/WebKit/standards-positions/) of this are:

*   support ⇒ Positive
*   neutral ⇒ Neutral
*   oppose ⇒ Negative
*   not considering ⇒ No Signals
*   blocked ⇒ No Signals
*   duplicate ⇒ usually use the URL and signal of whatever position this is a
    duplicate of
*   invalid ⇒ If you don't understand why the position is "invalid", ask your
    [spec-mentor](/blink/spec-mentors/) for help.
