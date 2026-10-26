package com.dan.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void createsTaskWithDueDate() throws Exception {
		mockMvc.perform(post("/api/tareas")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "titulo": "Entregar propuesta",
						  "fechaVencimiento": "2026-11-03",
						  "estado": "POR_HACER",
						  "prioridad": "ALTA"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.fechaVencimiento").value("2026-11-03"));
	}
}
