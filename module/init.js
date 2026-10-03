Hooks.on("hoverToken", async (token, hovered) => {

  if (!hovered) {
    removeTooltip();
    return;
  }

  const actor = token.document.actorId;
  if (!actor){
    const uuid = token.document.flags.magicalogia.uuid;
    const item = await fromUuid(uuid);

    if (!item) {
      return;
    }

    const userId = game.user.id;

    const visible = game.user.isGM || item.system.visible?.[userId] === true;

    const sVisible = game.user.isGM || item.system.sVisible?.[userId] === true;
    const content = await foundry.applications.handlebars.renderTemplate(
      "modules/magicalogia-tooltips/templates/token-tooltip.hbs",
      {
        item,
        visible,
        sVisible
      }
    );
    showTooltip(content);
  } else {
    const isView = token.actor?.testUserPermission(game.user, "OBSERVER");
    const abilities = token.actor?.items.filter(
      item => item.type === "ability"
    );
    const content = await foundry.applications.handlebars.renderTemplate(
      "modules/magicalogia-tooltips/templates/actor-tooltip.hbs",
      {
        actor: token.actor,
        abilities,
        isView
      }
    );
    showTooltip(content);
  }
});


Hooks.on("renderApplication", removeTooltip);
Hooks.on("canvasReady", removeTooltip);

Hooks.once("ready", () => {
  $(document).on(
    "mousedown.tooltip-remove contextmenu.tooltip-remove",
    removeTooltip,
  );
  $(window).on("blur.tooltip-remove", removeTooltip);
  $(window).on("blur.token-tooltip", removeTooltip);

  Hooks.on("renderApplication", removeTooltip);
  Hooks.on("canvasReady", removeTooltip);
});

function showTooltip(content) {
  removeTooltip();

  const tooltip = $(content);

  $("body").append(tooltip);

  $(document).on("mousemove.token-tooltip", (e) => {
    tooltip.css({
      left: e.clientX + 12,
      top: e.clientY + 12,
    });
  });
}

function removeTooltip() {
  $("#token-tooltip").remove();
  $(document).off(".token-tooltip");
}
