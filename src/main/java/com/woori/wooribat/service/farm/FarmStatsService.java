package com.woori.wooribat.service.farm;

import java.util.Map;

public interface FarmStatsService {
    public Map<String, Object> getFolderStats(String userId);
    public Map<String, Object> getFolderStatusStats(String userId, Integer folderId);

}
