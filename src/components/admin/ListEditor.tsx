import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "./ImageField";

export type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "number" | "boolean" | "list" | "select";
  options?: string[];
  placeholder?: string;
};

export type ListSpec = {
  label: string;
  description: string;
  /** Undefined for plain string lists (e.g. gallery). */
  fields?: FieldSpec[];
  newItem: () => unknown;
  /** Field used as the row heading. */
  titleField?: string;
  /** Renders a single string entry as an image picker. */
  stringAsImage?: boolean;
};

function FieldControl({
  spec,
  value,
  slug,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  slug: string;
  onChange: (next: unknown) => void;
}) {
  const type = spec.type ?? "text";

  if (type === "image") {
    return (
      <ImageField label={spec.label} slug={slug} value={String(value ?? "")} onChange={onChange} />
    );
  }

  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
        <Label>{spec.label}</Label>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <Label>{spec.label}</Label>
        <Textarea
          rows={3}
          value={String(value ?? "")}
          placeholder={spec.placeholder ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (type === "list") {
    const items = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="space-y-2">
        <Label>{spec.label}</Label>
        <Textarea
          rows={3}
          value={items.join("\n")}
          placeholder="One item per line"
          onChange={(event) =>
            onChange(
              event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
        />
        <p className="text-xs text-muted-foreground">One item per line.</p>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="space-y-2">
        <Label>{spec.label}</Label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        >
          {(spec.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{spec.label}</Label>
      <Input
        type={type === "number" ? "number" : "text"}
        value={value === undefined || value === null ? "" : String(value)}
        placeholder={spec.placeholder ?? ""}
        onChange={(event) =>
          onChange(type === "number" ? Number(event.target.value) : event.target.value)
        }
      />
    </div>
  );
}

export function ListEditor({
  spec,
  items,
  slug,
  onChange,
}: {
  spec: ListSpec;
  items: unknown[];
  slug: string;
  onChange: (next: unknown[]) => void;
}) {
  function replace(index: number, next: unknown) {
    const copy = items.slice();
    copy[index] = next;
    onChange(copy);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const copy = items.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    onChange(copy);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{spec.description}</p>
        <Button size="sm" onClick={() => onChange([...items, spec.newItem()])}>
          <Plus className="mr-1 h-4 w-4" /> Add {spec.label.toLowerCase()}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing here yet — add your first entry.
        </p>
      ) : null}

      <div className="space-y-4">
        {items.map((item, index) => {
          const record = (item ?? {}) as Record<string, unknown>;
          const heading = spec.fields
            ? String(record[spec.titleField ?? spec.fields[0]!.key] ?? "") ||
              `${spec.label} ${index + 1}`
            : `${spec.label} ${index + 1}`;

          return (
            <div key={index} className="rounded-lg border border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-semibold">{heading}</h4>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {spec.fields ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {spec.fields.map((field) => (
                    <div
                      key={field.key}
                      className={
                        field.type === "textarea" || field.type === "list" || field.type === "image"
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <FieldControl
                        spec={field}
                        slug={slug}
                        value={record[field.key]}
                        onChange={(next) => replace(index, { ...record, [field.key]: next })}
                      />
                    </div>
                  ))}
                </div>
              ) : spec.stringAsImage ? (
                <ImageField
                  label="Image"
                  slug={slug}
                  value={String(item ?? "")}
                  onChange={(url) => replace(index, url)}
                />
              ) : (
                <Input value={String(item ?? "")} onChange={(e) => replace(index, e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
