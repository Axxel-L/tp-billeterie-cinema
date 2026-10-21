package fr.butinfo.r508.billetterie.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(TmdbProperties.class)
public class MediaConfig {

    @Bean
    public RestClient tmdbRestClient(TmdbProperties proprietes) {
        SimpleClientHttpRequestFactory fabrique = new SimpleClientHttpRequestFactory();
        fabrique.setConnectTimeout(3_000);
        fabrique.setReadTimeout(4_000);
        return RestClient.builder()
                .baseUrl(proprietes.baseUrl())
                .requestFactory(fabrique)
                .build();
    }
}
