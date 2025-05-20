export function addItems2List(links, existingLinks, add_links) {
  let new_links = [];
  links.forEach((node) => {
    const isInLinks = existingLinks.some(
      (l) => l.x_node === node.x_node && l.y_node === node.y_node
    );
    const shouldModifyLink =
      (add_links && !isInLinks) || (!add_links && isInLinks);
    if (shouldModifyLink) {
      const linkData = getLinkData({
        x_node: node.x_node,
        y_node: node.y_node,
      });

      new_links.push(linkData);
    }
  });

  return new_links;
}

function getLinkData(link) {
  const formatted_link = {};
  formatted_link.key = link.x_node + link.y_node;
  formatted_link.x_node = link.x_node;
  formatted_link.y_node = link.y_node;

  return formatted_link;
}
