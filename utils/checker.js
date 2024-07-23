exports.checker = (subCategoryIds, subCategoriesIdsInCategory) =>
  subCategoryIds.every((subCategoryId) =>
    subCategoriesIdsInCategory.includes(subCategoryId)
  );
