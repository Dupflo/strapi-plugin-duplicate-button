import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import { Button } from "@strapi/design-system/Button";
import Duplicate from "@strapi/icons/Duplicate";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import usePluginsQueryParams from "@strapi/admin/admin/src/content-manager/hooks/usePluginsQueryParams";

const DuplicateButton = () => {
  const { modifiedData, onChange, layout, isCreatingEntry } = useCMEditViewDataManager();

  const { editRelations } = layout.layouts;

  const {
    push,
    location: { pathname },
  } = useHistory();

  const { formatMessage } = useIntl();
  const pluginsQueryParams = usePluginsQueryParams();

  const resetEditRelationsConflict = () => {
    const conflictPairs = [];
    editRelations.forEach((relation) => {
      const mappedByRelation = editRelations.find(({ fieldSchema }) => fieldSchema.mappedBy === relation.name);
      const inversedByRelation = editRelations.find(({ fieldSchema }) => fieldSchema.inversedBy === relation.name);
      conflictPairs.push(mappedByRelation || inversedByRelation);
      if (conflictPairs.length == 2) {
        conflictPairs.reduce((first, second) => {
          if (first.fieldSchema.relationType !== second.fieldSchema.relationType) {
            const oneToManyType = conflictPairs.find((relation) => relation.fieldSchema.relationType === "oneToMany");
            onChange({ target: { name: oneToManyType.name, value: [] } });
          }
        });
      }
    });
  };

  const handleDuplicate = () => {
    const copyPathname = pathname.replace(layout.uid, `${layout.uid}/create/clone`);
    push({
      pathname: copyPathname,
      state: { from: pathname },
      search: pluginsQueryParams,
    });
  };

  const content = {
    id: "duplicate-button.components.duplicate.button",
    defaultMessage: "Duplicate",
  };

  useEffect(() => {
    if (!isCreatingEntry) return;
    resetEditRelationsConflict();
  }, [isCreatingEntry]);

  return (
    <>
      {modifiedData.id && (
        <Button variant="secondary" startIcon={<Duplicate />} onClick={handleDuplicate}>
          {formatMessage(content)}
        </Button>
      )}
    </>
  );
};

export default DuplicateButton;
