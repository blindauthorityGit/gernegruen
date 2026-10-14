import type {ToolMenuProps} from "sanity";
import {CalendarIcon} from "@sanity/icons/Calendar";
import {EditIcon} from "@sanity/icons/Edit";
import {DocumentsIcon} from "@sanity/icons/Documents";

const toolPresentation: Record<string, {title: string; icon?: typeof DocumentsIcon}> = {
  structure: {title: "Inhalte", icon: DocumentsIcon},
  presentation: {title: "Live-Bearbeitung", icon: EditIcon},
  releases: {title: "Veröffentlichungen", icon: CalendarIcon},
};

export function StudioToolMenu(props: ToolMenuProps) {
  const tools = props.tools.map((tool) => {
    const normalizedName = `${tool.name} ${tool.title}`.toLocaleLowerCase("de-DE");
    const key = normalizedName.includes("structure") ? "structure"
      : normalizedName.includes("presentation") ? "presentation"
      : normalizedName.includes("release") ? "releases"
      : tool.name;
    const presentation = toolPresentation[key];
    return presentation ? {...tool, ...presentation} : tool;
  });

  return props.renderDefault({...props, tools});
}
