/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { sanitizeHtml } from "@/lib/sanitize-html";

/*
 * Lighthouse audit "details" renderers, ported from report.jsx. Each Lighthouse
 * audit id has a different details shape, so each gets a small table. These
 * thumbnails come from arbitrary third-party pages being audited (not a fixed
 * host list), so plain <img> is used instead of next/image, which requires a
 * static remotePatterns allowlist.
 */

const bytesToKB = (bytes: number) => (bytes / 1024).toFixed(2);

function convertMilliseconds(ms: number): string {
  if (ms <= 1000) return `${ms.toFixed(1)}ms`;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${days ? days + "d " : ""}${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${seconds ? seconds + "s" : ""}`.trim();
}

function shortenUrl(url?: string): string {
  if (!url) return "";
  const display = url.length > 50 ? url.slice(url.length / 2) : url;
  return sanitizeHtml(
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sm block max-w-[250px] text-ellipsis overflow-hidden !text-gray-700 hover:underline whitespace-nowrap">${display}</a>`
  );
}

export function UrlTable({ items }: { items: any[] }) {
  if (!items?.length) return null;
  const first = items[0];
  return (
    <table className="w-full border border-lightblue-100">
      <thead>
        <tr className="bg-lightblue-100">
          {first?.url && <th className="text-left font-normal p-3">Url</th>}
          {first?.totalBytes > 0 && <th className="text-left font-normal p-3">Transfer Size</th>}
          {(first?.wastedBytes || first?.wastedMs) && (
            <th className="text-left font-normal p-3">Potential Savings</th>
          )}
          {first?.groupLabel && <th className="text-left font-normal p-3">Category</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-gray-200" : ""}>
            <td className="px-3 py-2">
              {item?.url && <div dangerouslySetInnerHTML={{ __html: shortenUrl(item.url) }} />}
              {item?.source?.url && (
                <div dangerouslySetInnerHTML={{ __html: shortenUrl(item.source.url) }} />
              )}
              {item?.groupLabel}
            </td>
            {item?.duration != null && <td className="px-3 py-2 text-right">{convertMilliseconds(item.duration)}</td>}
            {item?.totalBytes > 0 && <td className="px-3 py-2">{bytesToKB(item.totalBytes)} KiB</td>}
            {(item?.wastedBytes || item?.wastedMs) && (
              <td className="px-3 py-2">
                {item.wastedMs ? convertMilliseconds(item.wastedMs) : ""}
                {item.wastedBytes ? bytesToKB(item.wastedBytes) + " KiB" : ""}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ImageCardTable({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <table className="w-full border border-lightblue-100 table-fixed">
      <thead>
        <tr className="bg-lightblue-100">
          {items[0]?.url && <th className="text-left font-normal p-3">Image</th>}
          {items[0]?.totalBytes && <th className="text-left font-normal p-3">Transfer Size</th>}
          {items[0]?.wastedBytes && <th className="text-left font-normal p-3">Potential Savings</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-gray-200" : ""}>
            <td className="px-3 py-2">
              {item?.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="Audited page image" width={100} height={100} />
                </a>
              )}
            </td>
            {item?.totalBytes && <td className="px-3 py-2">{bytesToKB(item.totalBytes)} KiB</td>}
            {item?.wastedBytes && <td className="px-3 py-2">{bytesToKB(item.wastedBytes)} KiB</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DomSizeTable({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <table className="w-full border border-lightblue-100">
      <thead>
        <tr className="bg-lightblue-100">
          <th className="text-left font-normal p-3">Statistic</th>
          <th className="text-left font-normal p-3">Value</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-gray-200" : ""}>
            <td className="px-3 py-2">{item?.statistic}</td>
            <td className="px-3 py-2">{item?.value?.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AccessibilityTable({ items }: { items: any[] }) {
  if (!items?.length) return null;
  const first = items[0];
  return (
    <table className="w-full border border-lightblue-100 table-fixed">
      <thead>
        <tr className="bg-lightblue-100">
          {first?.href && <th className="text-left font-normal p-3">Href</th>}
          {first?.text && <th className="text-left font-normal p-3">Text</th>}
          {first?.node?.nodeLabel && <th className="text-left font-normal p-3">Label</th>}
          {first?.node?.selector && <th className="text-left font-normal p-3">Selector</th>}
          {first?.node?.snippet && <th className="text-left font-normal p-3">Snippet</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-gray-200" : ""}>
            {item?.href && (
              <td className="px-3 py-2 text-sm font-semibold">
                <a href={item.href} className="text-blue-500" target="_blank" rel="noopener noreferrer">
                  {item.href}
                </a>
              </td>
            )}
            {item?.text && <td className="px-3 py-2 text-sm font-semibold">{item.text}</td>}
            {item?.node?.nodeLabel && <td className="px-3 py-2 text-sm font-semibold">{item.node.nodeLabel}</td>}
            {item?.node?.selector && (
              <td className="px-3 py-2 text-sm text-dark-100 break-all">
                <div className="max-h-[150px] overflow-auto">{item.node.selector}</div>
              </td>
            )}
            {item?.node?.snippet && (
              <td className="px-3 py-2 text-sm text-blue-500 break-all">
                <div className="max-h-[150px] overflow-auto">{item.node.snippet}</div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function BestPracticesTable({ items }: { items: any[] }) {
  if (!items?.length) return null;
  const first = items[0];
  return (
    <table className="w-full border border-lightblue-100 table-fixed">
      <thead>
        <tr className="bg-lightblue-100">
          {first?.scriptUrl && <th className="text-left font-normal p-3">Script Url</th>}
          {first?.source && <th className="text-left font-normal p-3">Source</th>}
          {first?.description && <th className="text-left font-normal p-3">Description</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-gray-200" : ""}>
            {item?.scriptUrl && (
              <td className="px-3 py-2 text-sm font-semibold" dangerouslySetInnerHTML={{ __html: shortenUrl(item.scriptUrl) }} />
            )}
            {item?.source && (
              <td className="px-3 py-2 text-sm text-dark-100 break-all">
                {item.source?.url ?? item.source?.type}
              </td>
            )}
            {item?.description && (
              <td className="px-3 py-2 text-sm text-red-500 break-all max-h-[150px] overflow-auto">
                {item.description}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
