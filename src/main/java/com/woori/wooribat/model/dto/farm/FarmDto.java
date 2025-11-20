package com.woori.wooribat.model.dto.farm;

import java.time.LocalDateTime;

import javax.persistence.Column;

import io.opencensus.metrics.export.Point;

public class FarmDto {
	private long id;
	private long user_id;
	private long folder_id;
	private String name;
	private String pnu;
	private String address;
	
	@Column(columnDefinition = "geometry(Point, 3857")
	private Point centerPoint;
	
	private long area;
	private String currentStatus;
	private String memo;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
