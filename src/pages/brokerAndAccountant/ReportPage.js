@Query("SELECT COALESCE(SUM(s.grossWeight), 0) FROM StockEntity s WHERE s.fridge.id = :fridgeId AND s.status = 'ACTIVE'")
BigDecimal sumGrossWeightByFridgeId(@Param("fridgeId") Long fridgeId);