package com.woori.wooribat.service.auth;

import java.io.IOException;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GoogleUserService {

	@Value("${google.user.info.uri}")
	private String userInfoUri;

	// 유저 정보 가져오기
	public JsonNode getUserInfo(String accessToken) throws IOException {
		HttpClient httpClient = HttpClientBuilder.create().build();
		HttpGet httpGet = new HttpGet(userInfoUri);
		httpGet.setHeader("Authorization", "Bearer " + accessToken);

		HttpResponse response = httpClient.execute(httpGet);
		String responseBody = EntityUtils.toString(response.getEntity());

		ObjectMapper mapper = new ObjectMapper();
		return mapper.readTree(responseBody);
	}
}
